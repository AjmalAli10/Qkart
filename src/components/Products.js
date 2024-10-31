import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import Cart, {generateCartItemsFrom} from "./Cart";
import "./Products.css";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
import "./Products.css";


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {
  const token = localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const [onLoading, setOnLoading] = useState(false)

  const [products, setProducts] = useState([]);
  const [filterProduct, setFilterProduct] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState("");
  const [items, setItems] = useState([]);
  // console.log(products)
  // console.log(items)

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    setOnLoading(true)
    try{
      const response = await axios.get(config.endpoint + "/products")
      setOnLoading(false)
      // console.log(res.data[0]);
        const arrayProduct = response.data;
        setProducts(arrayProduct)
        console.log(products)
        setFilterProduct(arrayProduct) 
      
    }catch(e){
      onLoading(false)
      if(e.response && e.response.status === 500){
        enqueueSnackbar(e.resposne.data.message, {variant: "error"})
        return null
      }else{
        enqueueSnackbar("backend is not started", {variant : "error"})
      }
    }

  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try{
      const response = await axios.get(`${config.endpoint}/products/search?value=${text}`)
        console.log(response.data)
        setFilterProduct(response.data)
        return response.data
    }catch(e){
      if(e.response){
        if(e.response.status === 404){
          setFilterProduct([])
      }
      if(e.response.status === 500){
        enqueueSnackbar(e.resposne.data.message, {variant: "error"})
        setFilterProduct(products)
      }
      }else{
        enqueueSnackbar("backend is not started", {variant : "error"})
      }
    }

  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    const value = event.target.value;
    if(debounceTimeout){
      clearTimeout(debounceTimeout)
    }
    const newDebounceTimeout = setTimeout(()=>{
      performSearch(value)
    },500)
    setDebounceTimeout(newDebounceTimeout)
  };

  const fetchCart = async(token)=>{
    if(!token) return;
    try{
      const response = await axios.get(`${config.endpoint}/cart`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      // console.log(response.data)
      return response.data
    }catch{
      enqueueSnackbar("Backend is not able to get the cart" ,{variant:"error"})
      return null;
    }
  }

  // const isItemInCart = (items, productId)=>{
  //   const itemInCart= items.findIndex((item)=> item.productId === productId) !== -1;
  //   return itemInCart;
  // }
  // const isItemInCart = (items, productId)=>{
  //   return items.findIndex((item)=> item.productId === productId) !== -1;
  // }
  // const updateCartItems = (cartData, products)=>{
  //   const cartItems = generateCartItemsFrom(cartData, products);
  //   setItems(cartItems);
  // };

  const addToCart = async(
    token,
    items,
    productId,
    products,
    qty, 
    options = {preventDuplicate: false}) =>{
    console.log(items)
    if(!token){
      enqueueSnackbar("Login to add the items to the cart", {variant:"warning"});
      return;
    }
    // if(isItemInCart(items, productId)){
    //   enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item", {variant : "warning"});
    //   return;
    // }
    if(options.preventDuplicate && items.find((item)=> item.productId === productId)){
      enqueueSnackbar("Item already in cart. Use the item sidebar to add and remove the item", {variant : "warning"})
      return;
    }
    // console.log("Add to cart", productId)
    try{  
        const response = await axios.post(`${config.endpoint}/cart`,
        {productId, qty},
        {
          headers:{
            Authorization: `Bearer ${token}`
          },
        }
        )
        // updateCartItems(response.data, products)
        const cartItems = generateCartItemsFrom(response.data, products)
        console.log(cartItems)
        setItems(cartItems)
    }catch(e){
      if(e.response){
        enqueueSnackbar(e.resposne.data.message, {variant: "error"})
        return null
      }else{
        enqueueSnackbar("backend is not started", {variant : "error"})
      }
    }
  }

  useEffect(()=>{
      performAPICall();
      // fetchCart(token).then((cartData)=>generateCartItemsFrom(cartData, products)).then((cartItems)=>setItems(cartItems))
    //   const handleProductLoader = async()=>{
    //     await performAPICall();
    // }
    // handleProductLoader()
  },[])

  useEffect(()=>{
  fetchCart(token)
  .then((cartData)=>generateCartItemsFrom(cartData, products))
  .then((cartItems)=>{setItems(cartItems);console.log(cartItems)})
    // const handleProductLoader = async(products)=>{
    //   const cartData = await fetchCart(token);
    //   const cartItems = await generateCartItemsFrom(cartData, products);
    //   setItems(cartItems)
    // }
    // handleProductLoader(products)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[products])

  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
        className="search-desktop"
        size="small"
        // fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e)=>debounceSearch(e, debounceTimeout)}
      />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e)=>debounceSearch(e, debounceTimeout)}
      />
       <Grid container>
         <Grid item md={token? 9 : 12} className="product-grid">

           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
           {onLoading ? (<Box className="loading">
          <CircularProgress />
          <h4>Loading Products</h4>
         </Box>) 
         :
         (<Grid container marginY="1rem" paddingX="1rem" spacing={2}>
         {filterProduct.length ? (filterProduct.map((product)=>(
           <Grid item xs={6} md={3} key={product._id}>
            <ProductCard product={product} handleAddToCart={async()=>{
              await addToCart(
                token,
                items,
                product._id,
                products,
                1,
                {
                  preventDuplicate : true
                }
              )
            }}/>
            </Grid>
           ))) : <Box>
            <SentimentDissatisfied color="action"/>
            <h4 style={{color:"#636363"}}>No products found</h4>
            </Box>}
          </Grid>)}

         </Grid>

          {token ? (<Grid item xs={12} md={3} color="#E9F5E1" >
            <Cart products={products} items={items} handleQuantity={addToCart} />
          </Grid>): null}
       </Grid>
      <Footer />
    </div>
  );
};

export default Products;
