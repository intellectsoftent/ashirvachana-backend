const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BlogPost = sequelize.define(
  "BlogPost",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      defaultValue: "Rituals",
    },
    author: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    read_time: {
      type: DataTypes.STRING(30),
      defaultValue: "5 min read",
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    full_content: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "blog_posts",
  },
);

module.exports = BlogPost;
