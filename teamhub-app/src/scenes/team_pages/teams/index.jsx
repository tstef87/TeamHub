import React from "react";
import { useNavigate } from "react-router-dom";
import EnhancedTable from "../../elements/table/BasicTable";  
import useCollection from "../../../hooks/useCollection.js"; 
import { Box, Button } from "@mui/material";

// Table Columns 
const headCells = [
  { id: "name", label: "Teams" },
  { id: "org_cat", label: "Organization Type" },
  { id: "org", label: "Organization" },
  { id: "members", label: "Members", numeric: true },
  { id: "followers", label: "Fans", numeric: true }
];

export default function Teams() {
  const navigate = useNavigate();
  const { rows, loading } = useCollection("teams"); // your Firestore collection name

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <EnhancedTable
        title="Teams"
        headCells={headCells}
        rows={rows}
        loading={loading}
        defaultOrderBy="name"
        onRowClick={(row) => navigate(`/teams/${row.id}`)}      />

        <Button variant="contained" onClick={() => navigate("create-team")} sx={{ alignSelf: "flex-start" }}>
          Create Team
        </Button>
    </Box>
  );
}