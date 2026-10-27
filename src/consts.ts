// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

// Prefix a root-relative path with the configured `base` (e.g. '/toxicology_platform'),
// so internal links keep working when the site is served from a subpath.
export const withBase = (path: string) =>
	`${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;

export const SITE_TITLE = 'Drug and Toxicology Information Service (DATIS)';
export const SITE_DESCRIPTION =
	'Free, trusted drug and poison information for the public and healthcare professionals in Zimbabwe.';

// Icons use 24x24 viewBox paths from the official brand marks.
export const LINKEDIN_ICON =
	'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z';

// Social links shown in the header and footer.
export const SOCIAL_LINKS = [
	{
		name: 'X (Twitter)',
		href: 'https://x.com/datis_zim',
		icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
	},
	{
		name: 'LinkedIn',
		href: 'https://zw.linkedin.com/company/drug-and-toxicology-information-service',
		icon: LINKEDIN_ICON,
	},
	{
		name: 'Facebook',
		href: 'https://www.facebook.com/drugandtoxicologyinformationservices/',
		icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
	},
];

// Emergency numbers
export const EMERGENCY_NUMBER = '+263 77 214 3333'; // TODO: real emergency line
export const POISON_INFORMATION_NUMBER = '42933452'; // TODO: real poison information line

// Certificate request constants
export const CERTIFICATE_FEE_USD = 5;
export const PAYMENT_NUMBER = ''; // TODO: Fill in the payment number
export const PAYMENT_NAME = ''; // TODO: Fill in the payment name
