using MobileApp.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;

namespace MobileApp.Pages
{
    public partial class Note : ContentPage
    {
        public string NoteName {get;set;}
        public NotesService ns;

        public Note()
        {
            BindingContext = this;
            ns = new NotesService(App.token, Navigation);
            //Navigation.PushAsync(new LoginPage());
            InitializeComponent();
        }

        public async void Button_Clicked(object sender, EventArgs e)
        {
            var a = await ns.GetByTags("!view");
            //await Navigation.PushAsync(new LoginPage());
        }
    }
}
