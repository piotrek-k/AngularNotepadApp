using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
using WindowsClient.Models;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=234238

namespace WindowsClient.Views
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class NotesViewer : Page
    {
        public List<Part> Parts = new List<Part>();

        public NotesViewer()
        {
            this.InitializeComponent();
            Parts.AddRange(new List<Part> {
                new Part { Data="Test Data xD" },
                new Part { Data="Test Datfdgdfga xD" },
                new Part { Data="Tessdgdsft Data xD" },
                new Part { Data="Test Dafdgfta xD" },
                new Part { Data="Testdfg Data xD" },
            });
            partsToShow.Source = Parts;
        }

        private void listView_ContainerContentChanging(ListViewBase sender, ContainerContentChangingEventArgs args)
        {

        }
    }
}
