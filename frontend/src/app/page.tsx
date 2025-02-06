"use client";
import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

export default function Home() {
  const theme = useTheme();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [cvDataList, setCvDataList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setError("");
    setCvDataList([]);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const { data } = await axios.post("http://localhost:5001/process_cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCvDataList(data); // Assuming backend returns an array of parsed CV data
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (cvDataList.length === 0) return null;
    const theme = useTheme();
  
    return (
      <TableContainer component={Paper} sx={{ width: '100%' , boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ p: 2, backgroundColor: "#f5f5f5", fontWeight: "bold" }}>
          Processed CV Data
        </Typography>
        <Table>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              {["Name", "Age", "Email", "Address", "Education", "Work Experience"].map((header) => (
                <TableCell key={header} sx={{ color: "white", fontWeight: "bold" }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {cvDataList.map((cvData, index) => (
              <TableRow key={index} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" } }}>
                <TableCell>{cvData.name || "N/A"}</TableCell>
                <TableCell>{cvData.age || "N/A"}</TableCell>
                <TableCell>{cvData.email || "N/A"}</TableCell>
                <TableCell>{cvData.address || "N/A"}</TableCell>
                <TableCell>{cvData.education || "N/A"}</TableCell>
                <TableCell>{cvData.work_experience || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, sm: 6, md: 8 } }}>
      <Typography variant="h4" gutterBottom>
        Process Multiple CVs
      </Typography>
      <form onSubmit={handleSubmit} style={{  flexDirection: 'column', gap: '1rem' }}>
        <Button variant="contained" component="label" sx={{ mr: 2 }}>
          Choose Files
          <input type="file" multiple hidden onChange={handleFileChange} />
        </Button>
        <br/>

        {selectedFiles.length > 0 && (
            <List sx={{ pb: 2, pt: 0 }}>
            {selectedFiles.map((file, index) => (
              <ListItem key={index}>
              <ListItemText primary={file.name} />
              </ListItem>
            ))}
            </List>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{
            mt: 2,
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.primary.main,
            color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.common.white,
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.primary.dark,
            },
          }}
        >
          {loading ? "Processing..." : "Upload"}
        </Button>
      </form>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
       <br/>

      {renderTable()}
    </Container>
  );
}
