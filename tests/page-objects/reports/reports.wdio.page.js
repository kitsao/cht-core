const reportListID = '#reports-list';
const reportBodyDetails = '#reports-content .report-body .details';
const selectedCaseId = () => $(`${reportBodyDetails} > ul > li > p > span > a`);
const selectedCaseIdLabel = () => $(`${reportBodyDetails} ul > li > label > span`);
const submitterPlace = () => $('.position a');
const submitterPhone = () => $('.sender .phone');
const submitterName = () => $('.sender .name');
const firstReport = () => $(`${reportListID} li:first-child`);
const reportList = () => $(`${reportListID}`);
const submitReportButton = () => $('.action-container .general-actions:not(.ng-hide) .fa-plus');
const formLinkByHref = (href) => {
  return $(`.action-container .general-actions .dropup.open .dropdown-menu li a[href="#/reports/add/${href}"]`);
};

module.exports = {
  reportList,
  firstReport,
  submitterName,
  submitterPhone,
  submitterPlace,
  selectedCaseId,
  selectedCaseIdLabel,
  submitReportButton,
  formLinkByHref,
};
