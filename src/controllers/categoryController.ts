import { Category } from "../models/categoryModel";

export const createCategory = async (req: any, res: any) => {
  const { name } = req.body;
  try {
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getCategories = async (req: any, res: any) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
