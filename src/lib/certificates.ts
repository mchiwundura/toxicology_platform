// TODO: Wire up real endpoint when backend is ready
export async function submitCertificateRequest(formData: FormData): Promise<{ success: boolean; message?: string }> {
	const apiUrl = import.meta.env.PUBLIC_CE_API_URL;

	if (!apiUrl) {
		// No network request if API URL not set - log payload for testing
		const payload: Record<string, unknown> = {};
		for (const [key, value] of formData.entries()) {
			if (value instanceof File) {
				payload[key] = {
					name: value.name,
					size: value.size,
					type: value.type,
				};
			} else {
				payload[key] = value;
			}
		}
		console.log('Certificate request (no API URL set):', payload);
		return { success: true };
	}

	try {
		const response = await fetch(apiUrl, {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}

		return { success: true };
	} catch (error) {
		console.error('Certificate request failed:', error);
		return { success: false, message: 'Failed to submit request. Please try again.' };
	}
}
