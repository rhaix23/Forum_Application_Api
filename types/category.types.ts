import { Types } from "mongoose";
import { ISubcategoryWithDescription } from "./subcategory.types";

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  subcategories: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryWithSubcategories
  extends Omit<ICategory, "subcategories"> {
  subcategories: Types.ObjectId | ISubcategoryWithDescription;
}
