# FiberForge

FiberForge is a Visual Studio Code extension designed to streamline the process of setting up and generating code for GoFiber applications. With FiberForge, developers can quickly create backend projects and generate boilerplate code without the need for manual setup or command-line tools.

## Features

### FiberForge : Setup

Effortlessly set up your GoFiber project by providing your application name (`<appName>`) and selecting your preferred database type (`<database>`).


### FiberForge : Generate

Easily generate boilerplate code for your GoFiber application by selecting a configuration file (txt or json) through a convenient file picker. The configuration file should follow a specific format-

```
{
  "appName": "<APP_NAME>",
  "database": "<mysql/postgres/mongodb>",
  "tables": [
    {
      "name": "<TABLE_NAME>",
      "columns": {
        "FIRST_COLUMN_NAME": "<VALUE>",
        "...": "...",
        "NTH_COLUMN_NAME": "<VALUE>"
      }
    },
    "...": "..."
  ]
}
```
Replace placeholders (<...>) with your actual project details. The appName represents the name of your GoFiber application, while the database specifies the type of database (MySQL, PostgreSQL, or MongoDB) in lowercase. The tables array contains objects representing tables or collections in your database. Each table object should include a name property for the table/collection name and a columns property defining the columns/fields of the table/collection.

## Usage

1. Open the command palette (Ctrl+Shift+P or Cmd+Shift+P on macOS).
2. Type "FiberForge" to access the available commands.
3. Choose either "FiberForge: Generate" or "FiberForge: Setup" to initiate the respective process.

## Installation

Install the FiberForge extension directly from the Visual Studio Code Marketplace to enhance your GoFiber development experience.

## Requirements

- Visual Studio Code

## Get Started

1. Install the FiberForge extension in Visual Studio Code.
2. Use the provided commands to streamline your GoFiber project setup and code generation tasks directly within the editor.

## Contributions

Contributions and feedback are welcome! Feel free to submit issues or contribute enhancements via the [GitHub repository](<repository_link>).

Happy coding with FiberForge! 🚀

