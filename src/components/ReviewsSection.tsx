import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Star, Send, User, ThumbsUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewsSectionProps {
  merchantId: number;
  merchantRating: string | null;
  merchantReviewCount: number | null;
}

export default function ReviewsSection({
  merchantId,
  merchantRating,
  merchantReviewCount,
}: ReviewsSectionProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: reviewsData, isLoading } = trpc.reviews.list.useQuery({
    merchantId,
  });

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      setComment("");
      setRating(0);
      setShowForm(false);
      // Refetch is handled by tRPC invalidation
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    createReview.mutate({ merchantId, rating, comment });
  };

  const displayAvg = reviewsData?.avgRating || merchantRating || "0";
  const displayCount = reviewsData?.totalReviews || merchantReviewCount || 0;

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count =
      reviewsData?.items.filter((r) => r.rating === star).length || 0;
    const percentage = displayCount > 0 ? (count / displayCount) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-500" />
            التقييمات والآراء
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "إلغاء" : "أضف تقييمك"}
          </Button>
        </div>

        {/* Rating Summary */}
        <div className="flex items-center gap-8 mb-6 pb-6 border-b">
          <div className="text-center">
            <div className="text-5xl font-bold text-emerald-600">
              {displayAvg}
            </div>
            <div className="flex items-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(Number(displayAvg))
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {displayCount} تقييم
            </p>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-1">
            {distribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-3">{star}</span>
                <Star className="h-3 w-3 text-gray-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-6 text-left">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Review Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">تقييمك</h4>

            {/* Star Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm text-gray-500 mr-2">
                {rating > 0
                  ? rating === 5
                    ? "ممتاز"
                    : rating === 4
                    ? "جيد جداً"
                    : rating === 3
                    ? "جيد"
                    : rating === 2
                    ? "ضعيف"
                    : "سيء"
                  : "اختر تقييم"}
              </span>
            </div>

            <Textarea
              placeholder="شاركنا تجربتك مع هذا المتجر..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mb-3"
              rows={3}
            />

            <Button
              type="submit"
              disabled={rating === 0 || createReview.isPending}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Send className="h-4 w-4 ml-2" />
              {createReview.isPending ? "جاري الإرسال..." : "إرسال التقييم"}
            </Button>
          </form>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : reviewsData?.items && reviewsData.items.length > 0 ? (
          <div className="space-y-4">
            {reviewsData.items.map((review) => (
              <div key={review.id} className="border-b last:border-0 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="font-medium text-sm">
                      مستخدم #{review.userId}
                    </span>
                    {review.isVerified && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        موثق
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString("ar-SA")
                      : ""}
                  </span>
                </div>

                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {review.comment && (
                  <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                )}

                <div className="flex items-center gap-4 mt-2">
                  <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600">
                    <ThumbsUp className="h-3 w-3" />
                    مفيد
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">لا توجد تقييمات بعد</p>
            <p className="text-sm text-gray-400">
              كن أول من يقيّم هذا المتجر
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
