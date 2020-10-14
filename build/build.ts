import { createBuilder, docker, DockerRegistryCredentials, git, runtime, task, createGitHubActions, nodejs } from "https://deno.land/x/denogent@v0.1.8/mod.ts";

const nodeDependency = nodejs.setup('latest');

const install = task('install')
    .dependsOn(nodeDependency)
    .does(async ctx => {
        await runtime.command({ cmd: ['npm', 'install'], logger: ctx?.logger });
    });

const test = task('test')
    .dependsOn(install)
    .dependsOn(nodeDependency)
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
    .dependsOn([runtime.secret('docker_username'), runtime.secret('docker_password')])
    .when(async _ => await git.isTagged({ logger: false }))
    .does(async ctx => {
        await docker.client.push({ tag: await buildTags(), credentials: getDockerCredentials(), logger: ctx?.logger });
    });

function getDockerCredentials(): DockerRegistryCredentials {
    return {
        username: runtime.argValue('docker_username'),
        password: runtime.argValue('docker_password')
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
            image: 'ubuntu-latest',
            onPushTags: ['v*']
        })
    ] // define CI integrations here
});
