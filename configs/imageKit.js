import ImageKit from '@imagekit/nodejs';

const imageKit = new ImageKit({
  privateKey: process.env['IMAGEKIT_PRIVATE_KEY'],
  publicKey: process.env['IMAGEKIT_PUBLIC_KEY'],
  urlEndpoint: process.env['IMAGEKIT_URL_ENDPOINT'] // This is the default and can be omitted
});

// const response = await imageKit.upload({
//   file: fs.createReadStream('path/to/file'),
//   fileName: 'file-name.jpg',
//   folder: "logos"
// });

// console.log(response);
export default imageKit;