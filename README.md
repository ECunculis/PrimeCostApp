
<div align="center">
  <img src="/public/icon.ico" alt="Logo" title="Logo">
</div>
<h1 align="center">Prime Cost App</h1>

## Table of Contents
1. [Project description](#project-description)
    1. [Overview](#overview)

2. [How to run](#how-to-run)


## Project description

This is cross-platform desktop application written in JavaScript, HTML, CSS, using Electron, React and Bootstrap.

This project was initialy developed for the drink manufacturing company to solve their issue of having to manually calculate the direct and indirect cost of producing one unit of product. Such costs are: 
* Raw materials. These are materials which are directly related to product creation. For instance, to create such product as lemonade, water, sugar, flavour, organic acid and so on will be necessary.
* Packaging costs, which are costs related to product packaging, for instance, the plastic film which wraps the product in the groups of 6 bottles.
* Salary of the workers which are directly related to product creation.
* Fixed costs such as security, working zone cleaning, administration, electricity.
* Deposit, which have to be paid for the bottles.

### Overview

The main page consists of the table of products, where each product has its code number, name and the cost. If the product is clicked, new page opens with detailed description of what cost comprises of.

<img src="https://user-images.githubusercontent.com/31374191/164424849-c326b7ac-149b-4be7-b07b-1ca3549b4c2a.gif"/>

Navbar has the dropdown list of different general lists such as raw materials, package, electricity and so on. If one of the items are modified, they are propagated to all products which includes the modified item. Thus, it maked the price management of the product much easier, because if the price of one raw material item is changed, then this change is automatically propagated to all products which includes the item. 

![Animation2](https://user-images.githubusercontent.com/31374191/164440295-0b98c3e6-1ec6-45ca-bc3d-4bfdbf28ceff.gif)

![Animation3](https://user-images.githubusercontent.com/31374191/164442217-27dab78d-dd6c-4f11-baef-a3d248222446.gif)



## How to run

1. Download and install the node.js: https://nodejs.org/en/download/  
Verify the installation:
```
node -v
```
2. Install required modules and run the app using the following commands in the project folder: 
```
npm install
npm run dev
```
3. To build the project use the following command:
```
npm run electron:build
```
