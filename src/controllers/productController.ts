import { Product } from "../models/productModel";

export const createProduct = async (req: any, res: any) => {
  const { name, price, category, stock } = req.body;
  try {
    const product = new Product({ name, price, category, stock });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProducts = async (req: any, res: any) => {
  const { search, category, minPrice, maxPrice } = req.query;
  const filter: any = {};

  if (search) filter.name = { $regex: search, $options: "i" };
  if (category) filter.category = category;
  if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
  if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

  try {
    const products = await Product.find(filter).populate("category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
