import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useSnackbar } from "notistack";
import { getAuth } from "../auth/auth";

import {
  Box, Paper, Typography, Stack, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function statusColor(status) {
  const s = String(status || "ACTIVE").toUpperCase();
  if (s === "ACTIVE") return "success";
  if (s === "SUSPENDED") return "warning";
  if (s === "CLOSED") return "error";
  return "default";
}

export default function Clients() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // ✅ IMPORTANT: normalize role
  const role = (getAuth()?.role || "ANALYST").toUpperCase();
  const isAdmin = role === "ADMIN";

  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Status dialog
  const [statusOpen, setStatusOpen] = useState(false);
  const [row, setRow] = useState(null);
  const [nextStatus, setNextStatus] = useState("CLOSED");
  const [savingStatus, setSavingStatus] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/clients", {
        params: { search: search.trim() || undefined },
      });
      setItems(res.data || []);
    } catch (e) {
      enqueueSnackbar("Failed to load clients.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  function openStatusDialog(client, targetStatus) {
    setRow(client);
    setNextStatus(targetStatus);
    setStatusOpen(true);
  }

  async function confirmStatusChange() {
    if (!row) return;
    setSavingStatus(true);
    try {
      await api.patch(`/clients/${row.id}/status`, { status: nextStatus });
      enqueueSnackbar(`Client status changed to ${nextStatus}.`, { variant: "success" });
      setStatusOpen(false);
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "Status update failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Clients</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Search"
            placeholder="ACC001 / John"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button variant="contained" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </Button>

          {/* ✅ quick debug: show role in UI */}
          <Chip size="small" label={`Role: ${role}`} />
        </Stack>
      </Paper>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Full name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((c) => {
              const status = String(c.status || "ACTIVE").toUpperCase();
              const canReactivate = status !== "ACTIVE";
              return (
                <TableRow
                  key={c.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/clients/${c.id}`)}
                >
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.account}</TableCell>
                  <TableCell>{c.full_name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>
                    <Chip size="small" label={status} color={statusColor(status)} />
                  </TableCell>

                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="View details">
                      <IconButton size="small" onClick={() => navigate(`/clients/${c.id}`)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {/* ✅ ADMIN: activate/deactivate */}
                    {isAdmin ? (
                      canReactivate ? (
                        <Tooltip title="Reactivate client (set ACTIVE)">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => openStatusDialog(c, "ACTIVE")}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Deactivate client (set CLOSED)">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => openStatusDialog(c, "CLOSED")}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )
                    ) : (
                      <Tooltip title="Admin only">
                        <span>
                          <IconButton size="small" disabled>
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ p: 2 }}>
                    No clients found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change client status</DialogTitle>
        <DialogContent>
          <Typography>
            Change <b>{row?.account}</b> ({row?.full_name}) to <b>{nextStatus}</b>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            If client is not ACTIVE, they cannot submit new loan applications.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmStatusChange} disabled={savingStatus}>
            {savingStatus ? "Saving..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}