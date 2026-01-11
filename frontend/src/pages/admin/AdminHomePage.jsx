import { Link } from "react-router-dom";

export default function AdminHomePage() {
  return (
    <div>
      <Link to="/admin/perfumes/new">Créer un nouveau parfum</Link>
    </div>
  );
}
