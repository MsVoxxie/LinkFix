function embedHasContent(embed) {
	// Check if theres any content in the embed
	const image = embed?.image;
	const thumbnail = embed?.thumbnail;
	const description = embed?.description;

	// If any of the above is true, return true
	if (image || thumbnail || description) return true;
	return false;
}

const msgSpoiled = (content) => {
	const linkPattern = /<[^>]*>|(\|\|.*?\|\|)/;
	return linkPattern.test(content);
};

module.exports = {
	embedHasContent,
	msgSpoiled,
};
