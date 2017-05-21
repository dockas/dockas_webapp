# Version 0.0.0
INI : Add gitignore, changelog and readme files.
FEA : Create the very basic skeleton of the app.
FEA : Create basket and checkout process.
FEA : Create signup page.
FEA : Create admin area with products, users and orders.
ENH : Move create module to admin module.
BUG : Correct a bug with weak permission of .ssh keys.
ENH : Change hostnames for stage environment.
FEA : Add stage and prod rules to gulpfile.
FEA : Add prod.config.js to webpack config dir.
BUG : Correct a bug with proxy_pass to rest api in nginx.conf.tpl.
BUG : Correct a bug with uploader target url using hard coded http protocol in create product page.
BUG : Correct a bug with roles admin user page change role modal.
GIT : Checkout new darch commits.
ENH : Remove all hard coded http protocol from product image fetch.
FEA : Add mixpanel events.
FEA : Add admin invitations panel.
ENH : Add mainImage, images, owner fields to product creation.
ENH : Show open orders to admin orders table and filters.
FEA : Add invitation validation to signup page.
FIX : Fix file hostname for stage environment.
ENH : Add support phones in default config file.
ENH : Remove products from admin nav bar.
ENH : Add icons to admin nav bar itens.
ENH : Add brand selection/creation within product creation page.
ENH : Add order status update buttons in admin orders page.
ENH : Add edition components to product detail page.
ENH : Add list support (page, creation, load).
ENH : Add discount coupon to checkout review page.
ENH : Add My Orders and My Lists in main nav bar alongside Alerts and Account.
ENH : Use 100x100 logo version in signin/signup pages (to prevent huge resize blink when page load).
ENH : Set new logo and favicon images.
ENH : Add alert support with socket.io integration.
FEA : Create an independent badge component within commom modules.
ENH : Add price update modal within Product.Card component.
GIT : Checkout new darch commit fixing a bug with crypto.
BUG : Correct a bug with ProximaNova ligh woff font name.
BUG : Redirect to invitation page when user does not provided a invitation token in signup page.
BUG : Make users the default page of admin area.
BUG : Populate brand and check brand owner instead of product owners inside product detail page.
ENH : Add isBeta config variable to specify wether Beta mark shoul be rendered or not.
ENH : Wrap all tables in table-container div to enhance responsiveness.
ENH : Show only icon in admin nav bar when in phone screen.
ENH : Create alert page that gonna be accessible from phone screens.
ENH : Set all page links directly to main nav bar menu when in phone screen.
ENH : Many enhancement in responsiveness.
FEA : New location common module.
ENH : Add image placeholderPath to default config.
FEA : Enable to create tags,brands and products from a CSV file in product create page.
BUG : Fix a bug when product has no images at all in catalog item page.
ENH : Show placeholder image in product card component when there is no mainImage.
FEA : Create the brand detail page with banner.
ENH : Remove banner from product detail page.
ENH : Add CSV to create companies in product create page.
ENH : Change all lower/upper range fields to new gt/lt/gte/lte.
ENH : Add empty statistics route to product detail page and to brand detail page (visible only to brand/company owners).
FEA : Add infinite scroll to catalog list page.
ENH : Add data option to productUpdate action that enables force setting of some product fields.
ENH : Remove all console log calls.
ENH : Retrieve shared config from api.
FEA : Prevent user to checkout bellow a minimum price.
ENH : Add contact phone to address data and groupe all phone in user profile.
ENH : Remove paypal and mapbox keys from config file.
ENH : Add first priceGroups item in product card component (alongside price).
BUG : Correct a bug with tags change and empty search field setting old query name.
BUG : Correct a bug with access product.brand when product was not loaded yet in catalog item page.