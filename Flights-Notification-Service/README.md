# Basic Node Express Template

This is a base node js project template, which anyone can use as it has been prepared, by keeping some of the most important code principles and project management recommendations. Feel free to change anything.


`src` -> Inside the src folder all the actual source code regarding the project will reside, this well not include any kind of tests. (You might make separate tests folder)

Lets take a look inside the `src` folder

 - `config` -> In this folder anything and everything regarding any configurations of the setup of a library or module will be done. For e.g.: setting up `dotenv` and `server-config.js`.

 - `routes` -> In the routes folder, we register a route and the corresponding middleware and controllers to it.

 - `middlewares` -> they are just going to intercept the incoming reqquests where we can write our validators, authenticators, etc.

 - `controllers` -> they are the kind of last middlewares as post them you call your business layer to execute the business logic. In controllers we just recieve the incoming requests and data and then pass it to the business layer, and once business layer returns an output, we structure the API response in controllers and send the output.

 - `repositories` -> this folder contains all the logic using which we interact with the DB by writing queries, all the raw queries or ORM queries will go here.

 - `services` -> contains the business logic and interacts with repositories for data from the DB.

 - `utils` -> contains helper methods, error classes, etc.

 ### Setup the project

 - Clone this template from github and open in a text editor.
 - Run the following command:
    ```
    npm install
    ```
 - In the root directory create a `.env` file and the following env variables:
    ```
    PORT=<port number>
    ```
    example:
    ```
    PORT=3000
    ```
 - Go inside `src` folder and execute the following command:
    ```
    npx sequelize init --force
    ```
    - By executing the above command you will get the migrations and seeders folders along with confi.json file inside the config folder.<br>
    Make sure to replace put the correct values for the username, password, databse, host and dialect for each environment: development, test and production.

 - To run the server, run the following command:
    ```
    npm run dev
    ```
