using MobileApp.ViewModels;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;

namespace MobileApp.Pages
{
    public partial class LoginPage : ContentPage
    {
        LoginPageViewModel vm;

        public LoginPage()
        {
            vm = new LoginPageViewModel
            {
                UserName = "Test",
                Password = "12345"
            };
            
            BindingContext = vm;

            Debug.WriteLine(App.token);
            App.token = "inne";
            Debug.WriteLine(App.token);

            InitializeComponent();
        }
    }
}
