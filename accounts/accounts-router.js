const express = require("express");

const db = require("../data/dbConfig.js");

const router = express.Router();

//Create Account
router.post("/", checkReqBody, (req, res) => {
  const newAccount = req.body;
  db("accounts")
    .insert(newAccount, "id")
    .then(arr => {
      const id = arr[0];
      //array containing just id of single added item

      return db("accounts")
        .select("id", "name", "budget")
        .where({ id })
        .first()
        .then(account => {
          res.status(201).json(account);
        });
    })
    .catch(err => {
      console.log("Create Account Error:", err);
      res.status(500).json({ message: "Error creating this account" });
    });
});

//Read All Accounts
router.get("/", (req, res) => {
  db.select("*")
    .from("accounts")
    .then(accounts => {
      res.status(200).json(accounts);
    })
    .catch(err => {
      console.log("Read All Accounts Error:", err);
      res.status(500).json({ message: "Error getting accounts" });
    });
});

//Read Single Account
router.get("/:id", checkAccountId, (req, res) => {
  db.select("*")
    .from("accounts")
    .where({ id: req.params.id })
    .first()
    .then(account => {
      res.status(200).json(account);
    })
    .catch(err => {
      const { id } = req.params;
      console.log(`Read Account ID ${id} Error:`, err);
      res.status(500).json({ message: `Error getting account id ${id}` });
    });
});

//Update Account
router.put("/:id", checkAccountId, (req, res) => {
  const { id } = req.params;
  const changes = req.body;

  db("accounts")
    .where({ id })
    .update(changes)
    .then(count => {
        console.log(`${count} Account ${id} has been successfully updated.`);
      res
        .status(200)
        .json({
          message: `${count} Account ${id} has been successfully updated.`
        });
    })
    .catch(err => {
      const { id } = req.params;
      console.log(`Update Account ID ${id} Error:`, err);
      res.status(500).json({ message: `Error updating account id ${id}` });
    });
});

//Delete Account
router.delete("/:id", checkAccountId, (req, res) => {});

//custom middleware
function checkReqBody(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(404).json({ message: "Please enter account data" });
  } else if (req.method === "put") {
    if (!req.body.name || !req.body.budget) {
      res
        .status(404)
        .json({ message: "Please provide updates to account name or budget" });
    } else if (!req.body.name) {
      res.status(404).json({ message: "Please provide Account Name" });
    } else if (!req.body.budget) {
      res.status(404).json({ message: "Please provide Account Budget" });
    } else {
      next();
    }
  }
}

function checkAccountId(req, res, next) {
  const id = req.params.id;
  db.select("*")
    .from("accounts")
    //.where("id", "=", id)
    .where({ id })
    .first()
    .then(account => {
      if (account) {
        next();
      } else {
        res.status(400).json({ message: `${id} not a valid account number.` });
      }
    });
}

module.exports = router;
