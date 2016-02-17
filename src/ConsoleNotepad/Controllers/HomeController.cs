﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using ConsoleNotepad.Models;
using Microsoft.Data.Entity;
using ConsoleNotepad.OtherClasses;
using Microsoft.AspNet.Authorization;

namespace ConsoleNotepad.Controllers
{
    public class HomeController : Controller
    {
        private DataDbContext db;
        private readonly TokenAuthManager _tokenOptions;

        public HomeController(DataDbContext context, TokenAuthManager tokenOptions)
        {
            db = context;
            _tokenOptions = tokenOptions;
        }

        public IActionResult Index()
        {
            return View();
        }

        [Authorize]
        public IActionResult Notepad()
        {
            var a = db.Notes.Include(x => x.NoteTags).ToList();
            ViewData["AuthToken"] = _tokenOptions.TokenGenerator(User.Identity.Name, DateTime.UtcNow.AddMinutes(60));
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
