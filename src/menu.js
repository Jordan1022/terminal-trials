function parseTypedMenuChoice(choice, options) {
  const trimmed = String(choice || '').trim();
  if (!trimmed) {
    return { value: null, reason: 'invalid' };
  }

  const byKey = options.find((option) => option.key === trimmed);
  if (byKey) {
    if (byKey.disabled) {
      return { value: null, reason: 'disabled' };
    }
    return { value: byKey.value, reason: 'ok' };
  }

  if (/^\d+$/.test(trimmed)) {
    const index = Number(trimmed) - 1;
    if (index >= 0 && index < options.length) {
      const option = options[index];
      if (option.disabled) {
        return { value: null, reason: 'disabled' };
      }
      return { value: option.value, reason: 'ok' };
    }
  }

  return { value: null, reason: 'invalid' };
}

function formatTypedMenuLabel(option) {
  if (!option.disabled) {
    return option.label;
  }
  if (option.key) {
    return option.label.replace(new RegExp(`^${option.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`), '-)');
  }
  return option.label;
}

module.exports = {
  parseTypedMenuChoice,
  formatTypedMenuLabel
};
