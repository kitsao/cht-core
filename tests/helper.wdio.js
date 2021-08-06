const getTextForElements = async (elements) => {
	await(await elements())[0].waitForText();
	return Promise.all((await elements()).map(filter => filter.getText()));
};

module.exports = {
	getTextForElements,
};
