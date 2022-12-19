import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
require('dotenv').config()
export const Client = sanityClient({
    projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
    dataset: 'production',
    apiVersion: '2021-11-16',
    useCdn: process.env.ESLINT_NO_DEV_ERRORS,
    token: process.env.REACT_APP_SANITY_TOKEN,
});

const builder = imageUrlBuilder(Client);

export const urlFor = (source) => builder.image(source);