import { createBuilder } from "https://deno.land/x/denogent/lib/core/builder.ts";
import { task } from "https://deno.land/x/denogent/lib/core/task.ts";
import nodejs from "https://deno.land/x/denogent/lib/build-kits/nodejs/nodejs.ts";
import runtime from "https://deno.land/x/denogent/lib/runtime/runtime.ts";
import { createGitHubActions } from "https://deno.land/x/denogent/lib/ci/gh-actions/gh-actions.ts";
import docker from "https://deno.land/x/denogent@v0.1.4/lib/docker/docker.ts";

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

createBuilder({
    name: 'build',
    targetTasks: test,
    ciIntegrations: [
        createGitHubActions({
            image: 'ubuntu-latest'
        })
    ] // define CI integrations here
});
