const core = require('@actions/core');
const github = require('@actions/github');
const replace = require('replace-in-file');
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

async function run() {
  try {
    const githubWorkspacePath = process.env['GITHUB_WORKSPACE'];
    if (!githubWorkspacePath) {
      throw new Error('GITHUB_WORKSPACE not defined');
    }
    const rp_hostname = core.getInput('rp_hostname');
    const value_key = core.getInput('value_key');
    const rp_contact_group = core.getInput('rp_contact_group');
    const write_patient_state_flow = core.getInput('write_patient_state_flow');  
    const rp_api_token = core.getInput('rp_api_token');
    const rp_flows = core.getInput('rp_flows');
    const codeRepository = path.resolve(path.resolve(githubWorkspacePath), core.getInput('directory'));
    process.chdir(codeRepository);
    const appSettings = require(`${codeRepository}/app_settings.json`);
    const flowsFileName = `${codeRepository}/flows.js`;
    // console.log(appSettings);
    const options = {
      files: `${codeRepository}/app_settings.json`,
      from: [
        regex(search(appSettings, 'base_url')), 
        regex(search(appSettings, 'value_key')), 
        // search(appSettings, 'groups').expr, 
        // regex(search(appSettings, 'flow').expr)
      ],
      to: [
        rp_hostname, value_key, 
        `['${rp_contact_group}']`, 
        `'${write_patient_state_flow}'`
      ]
    };
    
    const flowsContent = `module.exports = ${rp_flows};`;

    setMedicCredentials(getCouchDbUrl(value_key), rp_api_token);
    replace(options);
    writeFlowsFile(flowsFileName, flowsContent);

    const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);  
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();