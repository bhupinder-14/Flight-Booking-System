const { StatusCodes } = require("http-status-codes");

const { UserService } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

/**
 * POST : /signup
 * req-body {email: 'user@email.com', password: '1234'}
 */
async function signup(req, res) {
  try {
    const user = await UserService.create({
      email: req.body.email,
      password: req.body.password,
    });
    SuccessResponse.data = user;
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * POST : /signin
 * req-header {'x-access-token: JWT_TOKEN}
 * req-body {email: 'user@email.com', password: '1234'}
 *
 * sets req.user = userID
 */

async function signin(req, res) {
  try {
    const user = await UserService.signin({
      email: req.body.email,
      password: req.body.password,
    });
    SuccessResponse.data = user;
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * POST : /role
 * req-header {'x-access-token: JWT_TOKEN}
 * req-body {id: 14, role: 'admin'}
 */

async function addRoleToUser(req, res) {
  try {
    const user = await UserService.addRoletoUser({
      role: req.body.role,
      id: req.body.id,
    });
    SuccessResponse.data = user;
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * POST : /addAdminRole
 * req-header {'x-access-token: JWT_TOKEN}
 * req-body {id: 14}
 */

async function addAdminRoleToUser(req, res) {
  try {
    const user = await UserService.addAdminRoleToUser(req.body.id);
    SuccessResponse.data = user;
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * POST : /addFlightCompanyRole
 * req-header {'x-access-token: JWT_TOKEN}
 * req-body {id: 14}
 */

async function addFlightCompanyRoleToUser(req, res) {
  try {
    const user = await UserService.addFlightCompanyRoleToUser(req.body.id);
    SuccessResponse.data = user;
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.log(error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

module.exports = {
  signup,
  signin,
  addRoleToUser,
  addFlightCompanyRoleToUser,
  addAdminRoleToUser,
};
