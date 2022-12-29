import { Types } from "mongoose";

export interface ISubcategoryIdAndName {
  _id: Types.ObjectId;
  name: string;
}

export interface ISubcategoryWithDescription extends ISubcategoryIdAndName {
  description: string;
}

export interface ISubcategory {
  _id: Types.ObjectId;
  name: string;
  description: string;
  category: Types.ObjectId;
  posts: Types.ObjectId[];
  allowUsersToPost: boolean;
  createdAt: Date;
  updatedAt: Date;
  _oldCategory: Types.ObjectId; // Not included in the database
}

export interface ISubcategoryWithCategory
  extends Omit<ISubcategory, "category"> {
  category: ISubcategoryIdAndName;
}

export interface IUpdateSubcategoryRequestBody {
  name: string;
  description: string;
  categoryId: Types.ObjectId;
  allowUsersToPost: boolean;
}

export interface ICreateSubcategoryRequestBody {
  name: string;
  description: string;
  categoryId: Types.ObjectId;
}
