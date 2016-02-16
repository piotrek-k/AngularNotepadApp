using ConsoleNotepad.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Data.Entity;
using System.Threading.Tasks;
using Microsoft.Data.Entity.ChangeTracking;
using System.Diagnostics;

namespace ConsoleNotepad.OtherClasses
{
    public class Functions
    {
        public static bool CheckIfListsAreEqual<T>(IEnumerable<T> list1, IEnumerable<T> list2)
        {
            var cnt = new Dictionary<T, int>();
            foreach (T s in list1)
            {
                if (cnt.ContainsKey(s))
                {
                    cnt[s]++;
                }
                else {
                    cnt.Add(s, 1);
                }
            }
            foreach (T s in list2)
            {
                if (cnt.ContainsKey(s))
                {
                    cnt[s]--;
                }
                else {
                    return false;
                }
            }
            bool result = cnt.Values.All(c => c == 0);
            return result;
        }

        public static void DisplayTrackedEntities(ChangeTracker changeTracker)
        {
            Trace.WriteLine("");

            var entries = changeTracker.Entries();
            foreach (var entry in entries)
            {
                Trace.WriteLine("Entity Name: " + entry.Entity.GetType().FullName);
                Trace.WriteLine("Status: " + entry.State.ToString());
            }
            Trace.WriteLine("");
            Trace.WriteLine("---------------------------------------");
        }
    }
}
