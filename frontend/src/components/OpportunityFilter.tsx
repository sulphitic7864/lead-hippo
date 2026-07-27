"use client";

import { useState, useMemo } from "react";
import { LeadGrid } from "@/components/LeadGrid";

export function OpportunityFilter({ leads }: { leads: any[] }) {
  const [search, setSearch] = useState("");

  const filteredLeads = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (keyword.length < 3) {
      return leads;
    }

    return leads.filter((lead) => {
      const searchableText = Object.values(lead)
        .map((value) => {
          if (typeof value === "object" && value !== null) {
            return JSON.stringify(value);
          }

          return String(value);
        })
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [search, leads]);


  return (
    <>
      <div className="opportunity-summary">
        <div>
          <strong>
            {
              filteredLeads.filter(
                (l) => l.status === "ACTIVE"
              ).length
            }
          </strong>{" "}
          opportunities currently available
        </div>

        <input
          type="search"
          placeholder="Search opportunities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <LeadGrid 
        key={search}
        leads={filteredLeads} 
      />
    </>
  );
}