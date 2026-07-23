import express = require('express');
import type { Router } from 'express';

function createRouter(): Router {
    return express.Router();
}

export = createRouter;
