import { ArrowRight } from "lucide-react";

function Category({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      className="category-card"
      onClick={onClick}
    >
      <div className="category-icon">
        {icon}
      </div>

      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <ArrowRight size={18} />
    </button>
  );
}

export default Category;