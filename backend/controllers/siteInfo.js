import SiteInfo from '../models/siteInfo.js';

export const getSiteInfo = async (req, res) => {
  try {
    const siteInfo = await SiteInfo.getInfo();
    return res.status(200).json(siteInfo);
  } catch (error) {
    console.error('Error fetching site info:', error);
    return res.status(500).json({ message: 'Unable to retrieve site info' });
  }
};

export const updateSiteInfo = async (req, res) => {
  try {
    const { email, supportEmail, phone, address, socialLinks } = req.body;
    const siteInfo = await SiteInfo.getInfo();

    if (email) siteInfo.email = email;
    if (supportEmail) siteInfo.supportEmail = supportEmail;
    if (phone) siteInfo.phone = phone;
    if (address) siteInfo.address = address;
    if (socialLinks) siteInfo.socialLinks = socialLinks;

    await siteInfo.save();
    return res.status(200).json(siteInfo);
  } catch (error) {
    console.error('Error updating site info:', error);
    return res.status(500).json({ message: 'Unable to update site info' });
  }
};
