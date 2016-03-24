using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using System.IO;
using Microsoft.AspNet.Hosting;
using Microsoft.AspNet.Http;
using Microsoft.Net.Http.Headers;
using Microsoft.AspNet.Authorization;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ConsoleNotepad.Controllers
{
    [Route("api/[controller]")]
    [Authorize("Bearer")]
    public class FileUploadController : Controller
    {
        private IHostingEnvironment _environment;

        public FileUploadController(IHostingEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost]
        public async Task<IActionResult> Index(ICollection<IFormFile> files)
        {
            var uploads = Path.Combine(_environment.WebRootPath, "uploads");
            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                    await file.SaveAsAsync(Path.Combine(uploads, fileName));
                }
                //return View();
            }
            return Ok();
        }

        /*
        <input id="file" type="file" name="files" multiple/>
        <input id="upload" type="submit" value="Upload" />

        <script>
            $("#upload").click(function(){
                var formData = new FormData();
                var totalFiles = $('#file')[0].files.length;
                console.log("totalFiles: " + totalFiles);
                for (var i = 0; i < totalFiles; i++) {
                    var file = $('#file')[0].files[i];

                    formData.append("files", file);
                }
                //console.dir($('#file')[0]);FGHHG
                //console.dir($('#file')[0].files);
                //console.dir($('#file')[0].files[0]);
        
                $.ajax({
                   url : '/api/fileupload',
                   type : 'POST',
                   data : formData,
                   processData: false,  // tell jQuery not to process the data
                   contentType: false,  // tell jQuery not to set contentType
                   success : function(data) {
                       console.log(data);
                       alert(data);
                   }
                });
            });
        </script>
        */
    }
}
