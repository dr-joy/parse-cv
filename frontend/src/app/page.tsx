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

export default function Home() {
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

    return (
      <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3, borderRadius: 2 }}>
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
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Process Multiple CVs
      </Typography>
      <form onSubmit={handleSubmit}>
        <Button variant="contained" component="label">
          Choose Files
          <input type="file" multiple hidden onChange={handleFileChange} />
        </Button>

        {selectedFiles.length > 0 && (
          <List>
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
          sx={{ mt: 2 }}
        >
          {loading ? "Processing..." : "Upload"}
        </Button>
      </form>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {renderTable()}
    </Container>
  );
}
