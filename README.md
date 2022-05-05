
<div align="center">
  <img src="/public/icon.ico" alt="Logo" title="Logo">
</div>
<h1 align="center">Prime Cost App</h1>

## Table of Contents
1. [Project description](#project-description)
    1. [Main Page](#main-page)
    2. [Dropdown List](#dropdown-list)
    3. [General list items](#general-list-items)
    4. [Changing product's description](#changing-products-description)


2. [How to run (for development)](#how-to-run-for-development)


## Project description

This is cross-platform desktop application written in JavaScript, HTML, CSS, using Electron, React and Bootstrap.

This project was initialy developed for the drink manufacturing company to solve their issue of having to manually calculate the direct and indirect cost of producing one unit of product. Such costs are: 
* Raw materials. These are materials which are directly related to product creation, for instance, water, flavouring, sugar, lemon acid are the main components of the lemonade.
* Packaging costs, which are costs related to product packaging, for instance, the plastic film which wraps the product in the groups of 6 bottles.
* Salary of the workers which are directly related to product creation.
* Fixed costs such as security, working zone cleaning, administration, electricity.
* Deposit, which have to be paid for the bottles.

### Main Page

The main page consists of the table of products, where each product has its code number, name and the cost. If the product is clicked, new page opens with detailed description of what cost comprises of.

<img src="https://user-images.githubusercontent.com/31374191/164424849-c326b7ac-149b-4be7-b07b-1ca3549b4c2a.gif"/>

### Dropdown List

Navbar has the dropdown list of different general lists such as raw materials, packaging, workers, that any product may contain. Dropdown also contains the electricity, deposit, excise tax calculation pages. 

![Animation2](https://user-images.githubusercontent.com/31374191/164440295-0b98c3e6-1ec6-45ca-bc3d-4bfdbf28ceff.gif)

### General list items

If price of one item in the general list is modified, this change is propagated to all products which includes the modified item. Thus, it makes the price management of products much easier, because there is no need in manually re-calculating the new price for a considerate number of products, when the price of raw materials, electricity, package are changed.

![Animation3](https://user-images.githubusercontent.com/31374191/164442217-27dab78d-dd6c-4f11-baef-a3d248222446.gif)

### Adding new item to the list

You can add new items to the raw material, package and worker list. Adding new item to the fixed cost list is not implemented yet.
![Animation4](https://user-images.githubusercontent.com/31374191/164885986-8b7470fa-5304-4609-b8de-6cc10be6b491.gif)

### Changing product's description

Each product description is adjustable. 

![Animation5](https://user-images.githubusercontent.com/31374191/164886762-3d37392a-269b-4265-b492-8d119ebd7573.gif)


## How to run (for development)

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
