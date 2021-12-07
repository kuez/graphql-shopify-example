/* eslint-disable import/order */
import {gql} from 'babel-plugin-graphql-js-client-transform';
const express = require('express');
const path = require('path');
const client = require('./graphql-js-client').default;
const app = express();

const shopNameAndProductsPromise = client.send(gql(client)`
    query {
      shop {
        name
        description
        products(first:20) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            node {
              id
              title
              options {
                name
                values
              }
              variants(first: 250) {
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
                edges {
                  node {
                    title
                    selectedOptions {
                      name
                      value
                    }
                    image {
                      src
                    }
                    price
                  }
                }
              }
              images(first: 250) {
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
                edges {
                  node {
                    src
                  }
                }
              }
            }
          }
        }
      }
    }
  `).then((result) => {
    return result.model.shop;
  });

app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, '../../shared')));

app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
  const checkoutId = req.query.checkoutId;

  // Create a checkout if it doesn't exist yet
  if (!checkoutId) {
    return client.send(gql(client)`
      mutation {
        checkoutCreate(input: {}) {
          userErrors {
            message
            field
          }
          checkout {
            id
          }
        }
      }
    `).then((result) => {
      res.redirect(`/?checkoutId=${result.model.checkoutCreate.checkout.id}`);
    });
  }

  // Fetch the checkout
  const cartPromise = client.send(gql(client)`
    query ($checkoutId: ID!) {
      node(id: $checkoutId) {
        ... on Checkout {
          webUrl
          subtotalPrice
          totalTax
          totalPrice
          lineItems (first:250) {
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            edges {
              node {
                title
                variant {
                  title
                  image {
                    src
                  }
                  price
                }
                quantity
              }
            }
          }
        }
      }
    }
  `, {checkoutId}).then((result) => {
    return result.model.node;
  });


  return Promise.all([shopNameAndProductsPromise, cartPromise]).then(([shop, cart]) => {
    res.render('index', {
      products: shop.products,
      cart,
      shop,
      isCartOpen: req.query.cart
    });
  });
});

app.listen(4200, () => {
  console.log('Example app listening on port 4200!'); 
});
