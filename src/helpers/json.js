const parseJsonProps = (content, fields = ['props']) => {
  fields.forEach((field) => {
    if (content?.[field]) {
      try {
        Object.assign(content, {
          [field]: JSON.parse(content[field]),
        });
      } catch (e) {
        console.error('parseJsonProps error:', e);
        Object.assign(content, {
          [field]: {},
        });
      }
    }
  });
  return content;
};

module.exports = {
  parseJsonProps,
};
