import { createBuilder } from "https://deno.land/x/denogent/lib/core/builder.ts";
import { task } from "https://deno.land/x/denogent/lib/core/task.ts";
import nodejs from "https://deno.land/x/denogent/lib/build-kits/nodejs/nodejs.ts";
import runtime from "https://deno.land/x/denogent/lib/runtime/runtime.ts";
import { createGitHubActions } from "https://deno.land/x/denogent/lib/ci/gh-actions/gh-actions.ts";
import docker from "https://deno.land/x/denogent@v0.1.4/lib/docker/docker.ts";
import git from "https://deno.land/x/denogent@v0.1.4/lib/git/git.ts";
import type { DockerRegistryCredentials } from "https://deno.land/x/denogent@v0.1.4/lib/docker/args.ts";

const nodeDependency = nodejs.setup('latest');

const install = task('install')
    .dependsOn(nodeDependency)
    .does(async ctx => {
        await runtime.command({ cmd: ['npm', 'install'], logger: ctx?.logger });
    });

const test = task('test')
    .dependsOn(install)
    .dependsOn(docker.service({ name: 'redis', image: 'redis', ports: [6379] }))
    .does(async ctx => {
        await runtime.command({ cmd: ['npm', 'test'], logger: ctx?.logger });
    });

const build = task('build')
    .does(async ctx => {
        await docker.client.build({ tag: await buildTags(), logger: ctx?.logger });
    });

const push = task('push')
    .dependsOn([test, build])
    .dependsOn([runtime.secret('docker-username'), runtime.secret('docker-password')])
    .when(async _ => await git.isTagged({ logger: false }))
    .does(async ctx => {
        await docker.client.push({ tag: await buildTags(), credentials: getDockerCredentials(), logger: ctx?.logger });
    });

function getDockerCredentials(): DockerRegistryCredentials {
    return {
        username: runtime.argValue('docker-username'),
        password: runtime.argValue('docker-password')
    };
}

async function buildTags(): Promise<string[]> {
    let tags = ['latest'];
    if (await git.isTagged({ logger: false })) {
        tags.push((await git.describe({ logger: false }))!);
    }

    return tags.map(t => `arellerdh/denogent-samples-nodejs:${t}`);
}

createBuilder({
    name: 'build',
    targetTasks: push,
    ciIntegrations: [
        createGitHubActions({
            image: 'ubuntu-latest'
        })
    ] // define CI integrations here
});
