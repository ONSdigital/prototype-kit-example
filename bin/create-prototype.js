#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const prototypeKitVersion = require('../package.json').version;

createPrototypesProject();

async function createPrototypesProject() {
    // Retrieve project name from CLI argument.
    const projectName = process.argv[2];
    if (!projectName || !/^[a-z][a-z0-9\-]+/.test(projectName)) {
        console.error('A name must be specified for the prototype of the form "my-special-prototypes" without quotes.');
        process.exit(1);
    }

    // Make a directory for the prototype; fail if the directory already exists to avoid losing work.
    const outputProjectPath = path.resolve(process.cwd(), projectName);
    await fs.mkdir(outputProjectPath);

    // Prepare 'project.json' for the prototype(s) project.
    await prepareProjectFileFromTemplate('./package.json', projectName, outputProjectPath);
    await prepareProjectFileFromTemplate('./README.md', projectName, outputProjectPath);

    // Initialise project as a git repository.
    await exec(`cd ${outputProjectPath} && git init`);

    // Success!
    console.log(`Project created at path '${outputProjectPath}'.`);
}

async function prepareProjectFileFromTemplate(templateFile, projectName, projectOutputPath) {
    const templatePath = path.resolve(__dirname, './project-template', templateFile);
    const template = await fs.readFile(templatePath, { encoding: 'utf8' });
    const output = template
        .replace(/{{PROJECT_NAME}}/g, projectName)
        .replace(/{{PROTOTYPE_KIT_VERSION}}/, prototypeKitVersion);

    const outputPath = path.resolve(projectOutputPath, path.basename(templateFile));
    await fs.writeFile(outputPath, output, { encoding: 'utf8' });
}
