export const runSEOAudit = () => {
    console.group('🔍 Automated SEO Audit Report');
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        errors.push('Missing meta description tag (<meta name="description" />)');
    } else if (!metaDescription.getAttribute('content')) {
        warnings.push('Meta description tag is present but content is empty');
    } else {
        const content = metaDescription.getAttribute('content') || '';
        if (content.length < 50) warnings.push('Meta description might be too short (under 50 characters)');
        if (content.length > 160) warnings.push('Meta description might be too long (over 160 characters)');
    }

    // Check Duplicate Title Tags
    const titleTags = document.querySelectorAll('title');
    if (titleTags.length === 0) {
        errors.push('Missing title tag (<title>)');
    } else if (titleTags.length > 1) {
        errors.push(`Duplicate title tags found (${titleTags.length} tags)`);
    }

    // Check Canonical Links
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
        warnings.push('Missing canonical link (<link rel="canonical" />)');
    } else if (!canonicalLink.getAttribute('href')) {
        errors.push('Canonical link is present but href is empty');
    }

    // Output Report
    if (errors.length === 0 && warnings.length === 0) {
        console.log('✅ All crucial SEO tags look good for the current route.');
    } else {
        if (errors.length > 0) {
            console.error('❌ SEO Errors:', errors);
        }
        if (warnings.length > 0) {
            console.warn('⚠️ SEO Warnings:', warnings);
        }
    }
    console.groupEnd();
};
