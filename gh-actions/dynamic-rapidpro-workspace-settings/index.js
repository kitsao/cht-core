const core = require('@actions/core');
const github = require('@actions/github');
const replace = require('replace-in-file');
const template = require('template-file')
const path = require('path');
const axios = require('axios').default;
const fs = require('fs');
var util = require('util')

const search = (haystack, needle) =>
  needle in haystack
    ? haystack[needle]
    : Object.values(haystack).reduce((acc, val) => {
      if (acc !== undefined) return acc;
      if (typeof val === 'object') return search(val, needle);
    }, undefined);

const regex = expr => new RegExp(expr, 'g');

const setMedicCredentials = (url, rp_api_token) => {
  axios({
    method: 'put',
    url: url,
    data: `"${rp_api_token}"`
  });
};

const writeFlowsFile = (filename, content) => fs.writeFileSync(filename, `module.exports = ${util.inspect(content)}\n`);

const getCouchDbUrl = (value_key) => {
  const couch_username = core.getInput('couch_username');
  const couch_password = core.getInput('couch_password');
  const hostname = core.getInput('hostname');
  const couch_node_name = core.getInput('couch_node_name');
  const url = new URL(`https://${hostname}/_node/${couch_node_name}/_config/medic-credentials/${value_key}`);
  url.username = couch_username;
  url.password = couch_password;
  return url;
};

const fields = ['rp_hostname', 'value_key', 'rp_contact_group', 'write_patient_state_flow', 'rp_api_token', 'rp_flows', 'directory']

const inputs = {
  'rp_hostname': 'blah_value'
}
const getInputs = (core) => {
  const result = {};
  fields.forEach((field) => {
    result[field] = core.getInput(field);
  });
  return result;
};

async function run() {
  try {
    const githubWorkspacePath = process.env['GITHUB_WORKSPACE'];
    if (!githubWorkspacePath) {
      throw new Error('GITHUB_WORKSPACE not defined');
    }

    const context = getInputs(core);
    const codeRepository = path.resolve(path.resolve(githubWorkspacePath), context.directory);
    process.chdir(codeRepository);
    const appSettings = require(`${codeRepository}/app_settings.json`);
    const flowsFileName = `${codeRepository}/flows.js`;
    // console.log(appSettings);

    const replacedString = await template.render('file-name', {
      'base_url': 'base_url_value',
      ...
    })

    await fs.write('file-name', replacedString);
    const options = {
      files: `${codeRepository}/app_settings.json`,
      from: [
        regex(search(appSettings, 'base_url')),
        regex(search(appSettings, 'value_key')),
        // search(appSettings, 'groups').expr,
        // regex(search(appSettings, 'flow').expr)
      ],
      to: [
        context.rp_hostname, context.value_key,
        `['${context.rp_contact_group}']`,
        `'${context.write_patient_state_flow}'`
      ]
    };

    const flowsContent = `module.exports = ${context.rp_flows};`;

    setMedicCredentials(getCouchDbUrl(context.value_key), context.rp_api_token);
    replace(options);
    writeFlowsFile(flowsFileName, flowsContent);

    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`); //eslint-disable no-console
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();