
interface TagProps { 
    content: string | null;
    style: string;
}

export default function Tag({
    content,
    style
}: TagProps) {
    return (
        <span
            className={style}
        >
            {content}
        </span>
    )
}