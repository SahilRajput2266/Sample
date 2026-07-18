const sectionNames = ['profile', 'jobs', 'applications'];

export const loadDashboardStats = async (requests) => {
  const results = await Promise.allSettled(requests);

  return results.reduce((state, result, index) => {
    const section = sectionNames[index];
    if (result.status === 'fulfilled') {
      state.data[section] = result.value.data;
    } else {
      state.errors.push(`Unable to load ${section} statistics`);
    }
    return state;
  }, { data: {}, errors: [] });
};