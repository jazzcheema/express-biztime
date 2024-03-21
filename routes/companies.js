"use strict";

const express = require("express");
const db = require('../db');

const { BadRequestError, NotFoundError } = require("../expressError");

const router = express.Router();


/**
 * GET request to /companies, return JSON: {companies: [{code, name}, ...]}
 */
router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name
         FROM companies`);
  const companies = results.rows;
  return res.json({ companies });
});




/**
 * GET request to /companies -- for companies code
 * return JSON: {company: {code, name, description}}
 */
router.get("/:code", async function (req, res, next) {
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description
         FROM companies
         WHERE code = $1`, [code]);

  const company = results.rows;

  if (company.length === 0) {
    throw new NotFoundError("Company code does not exist.");
  }
  return res.json({ company });
});




/** Create new company, returning {company: {code, name, description}};
 * Accepts json body: {code, name, description}
*/

router.post("/", async function (req, res, next) {
  if (!req.body) throw new BadRequestError('Missing company information.');

  const { code, name, description } = req.body;
  const result = await db.query(
    `INSERT INTO companies (code, name, description)
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
    [code, name, description],
  );
  const company = result.rows[0];
  return res.status(201).json({ company });
});



/** Update company, returning {company: {code, name, description}};
 * Accepts json body: {name, description}
*/

router.put("/:code", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();
  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
           SET name=$1,
           description=$2
           WHERE code = $3
           RETURNING code, name, description`,
    [name, description, req.params.code],
  );
  const company = result.rows[0];

  if (!company) {
    throw new NotFoundError("Company does not exist.");
  }
  return res.json({ company });
});


/** Delete company, returning {status: "deleted"};
 * Takes in company code as URL parameter
 */

router.delete("/:code", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name, description
          FROM companies
          WHERE code = $1`, [request.params.code]);

  const company = results.rows;
  if (company.length === 0) {
    throw new NotFoundError("Company code does not exist.");
  }

  const result = await db.query(
    "DELETE FROM companies WHERE code = $1",
    [req.params.code],
  );

  return res.json({ status: "deleted" });
});


module.exports = router;