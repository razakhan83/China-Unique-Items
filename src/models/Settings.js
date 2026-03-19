import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
    {
        // Use a singleton pattern: there's only one settings doc, identified by this key
        singletonKey: {
            type: String,
            default: 'site-settings',
            unique: true,
        },

        // General Info
        storeName: {
            type: String,
            default: 'China Unique Store',
        },
        supportEmail: {
            type: String,
            default: '',
        },
        businessAddress: {
            type: String,
            default: '',
        },

        // WhatsApp
        whatsappNumber: {
            type: String,
            default: '',
        },

        // Shipping Rates
        karachiDeliveryFee: {
            type: Number,
            default: 0,
        },
        outsideKarachiDeliveryFee: {
            type: Number,
            default: 0,
        },
        freeShippingThreshold: {
            type: Number,
            default: 5000,
        },

        // Banner / Notice
        announcementBarEnabled: {
            type: Boolean,
            default: true,
        },
        announcementBarText: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
