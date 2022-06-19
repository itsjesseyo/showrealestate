require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    title: `showrealestate`,
    siteUrl: `https://getreal.itsjesseyo.com`,
  },
  plugins: [{
    resolve: `./appwriter-source-plugin`,
  },
  `gatsby-buildtime-timezone`,
],
}
