import mongoose from 'mongoose';

const SocialLinkSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String, required: true },
});

const SiteInfoSchema = new mongoose.Schema({
  email: { type: String, default: 'aparupchowdhury79@gmail.com' },
  supportEmail: { type: String, default: 'aparupchowdhury79@gmail.com' },
  phone: { type: String, default: '+880 12345678' },
  address: { type: String, default: 'Kha 224 Pragati Sarani, Merul Badda, Dhaka 1212, Bangladesh' },
  socialLinks: {
    type: [SocialLinkSchema],
    default: [
      {
        name: 'instagram',
        url: 'https://instagram.com/resonance',
        icon: 'instagram',
      },
      {
        name: 'youtube',
        url: 'https://www.youtube.com/@aparupchowdhury6679',
        icon: 'youtube',
      },
      {
        name: 'twitter',
        url: 'https://twitter.com/resonance',
        icon: 'twitter',
      },
    ],
  },
}, {
  timestamps: true,
});

SiteInfoSchema.statics.getInfo = async function() {
  let info = await this.findOne();
  if (!info) {
    info = await this.create({});
  }
  return info;
};

const SiteInfo = mongoose.model('SiteInfo', SiteInfoSchema);
export default SiteInfo;
