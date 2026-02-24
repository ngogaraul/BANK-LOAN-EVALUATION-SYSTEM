import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import { useSnackbar } from "notistack";

import {
  Box, Typography, Paper, Divider, Grid, Stack, TextField, Button,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";

export default function ClientDetails() {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // financial form
  const [form, setForm] = useState({
    outstanding: "", payment_plan: "", remaining_period: "", periodicity: "", class_value: "",
    compulsory_saving: "", voluntary_saving: "", salary: "", duration: "", start_date: "",
  });

  // ✅ profile edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/clients/${id}`);
      setData(res.data);

      // set profile
      setProfile({
        full_name: res.data.full_name || "",
        phone: res.data.phone || "",
      });

      // set financials
      const fin = res.data.financials || {};
      setForm({
        outstanding: fin.outstanding ?? "",
        payment_plan: fin.payment_plan ?? "",
        remaining_period: fin.remaining_period ?? "",
        periodicity: fin.periodicity ?? "",
        class_value: fin.class_value ?? "",
        compulsory_saving: fin.compulsory_saving ?? "",
        voluntary_saving: fin.voluntary_saving ?? "",
        salary: fin.salary ?? "",
        duration: fin.duration ?? "",
        start_date: fin.start_date ?? "",
      });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "Failed to load client";
      setErr(msg);
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  async function saveFinancials() {
    setSaving(true);
    try {
      await api.put(`/clients/${id}/financials`, form);
      enqueueSnackbar("Financials updated.", { variant: "success" });
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "Update failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      await api.put(`/clients/${id}`, profile);
      enqueueSnackbar("Client profile updated.", { variant: "success" });
      setEditOpen(false);
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "Update failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setSavingProfile(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (err && !data) return <Alert severity="error">{err}</Alert>;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">
          Client: {data.account} — {data.full_name}
        </Typography>

        <Tooltip title="Edit profile">
          <IconButton onClick={() => setEditOpen(true)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Profile</Typography>
        <Divider sx={{ my: 1 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}><Typography><b>Account:</b> {data.account}</Typography></Grid>
          <Grid item xs={12} md={4}><Typography><b>Name:</b> {data.full_name}</Typography></Grid>
          <Grid item xs={12} md={4}><Typography><b>Phone:</b> {data.phone}</Typography></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Financials</Typography>
        <Divider sx={{ my: 1 }} />

        <Grid container spacing={2}>
          {Object.entries(form).map(([k, v]) => (
            <Grid item xs={12} md={4} key={k}>
              <TextField
                fullWidth
                label={k.replaceAll("_", " ")}
                value={v}
                onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
              />
            </Grid>
          ))}
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={load} disabled={saving}>Reset</Button>
          <Button variant="contained" onClick={saveFinancials} disabled={saving}>
            {saving ? "Saving..." : "Save Financials"}
          </Button>
        </Stack>
      </Paper>

      {/* ✅ Edit Profile Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Client Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full name"
              value={profile.full_name}
              onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
            />
            <TextField
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
