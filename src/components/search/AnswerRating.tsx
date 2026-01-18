import React, { useState } from 'react';
import { Star, MessageSquare, Send, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface AnswerRatingProps {
  answerId: string;
  onSubmit?: (rating: number, comment: string) => void;
}

export function AnswerRating({ answerId, onSubmit }: AnswerRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = (value: number) => {
    setRating(value);
    if (value <= 3) {
      setShowComment(true);
    }
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast({ title: 'Выберите оценку', variant: 'destructive' });
      return;
    }

    // Save to localStorage
    const ratings = JSON.parse(localStorage.getItem('answer_ratings') || '[]');
    ratings.push({
      id: answerId,
      rating,
      comment: comment.trim(),
      timestamp: Date.now(),
    });
    localStorage.setItem('answer_ratings', JSON.stringify(ratings));

    onSubmit?.(rating, comment);
    setSubmitted(true);
    toast({ title: 'Спасибо за оценку!', duration: 2000 });
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 px-6 py-4 border-t border-border bg-secondary/30">
        <Check className="w-4 h-4 text-success" />
        <span className="text-sm text-muted-foreground">
          Спасибо за вашу оценку! ({rating}/5 звёзд)
        </span>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 border-t border-border bg-secondary/30 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Оцените ответ:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleStarClick(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'w-5 h-5 transition-colors',
                    (hoveredRating || rating) >= value
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/40'
                  )}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <span className="text-xs text-muted-foreground ml-2">
              {rating === 1 && 'Плохо'}
              {rating === 2 && 'Ниже среднего'}
              {rating === 3 && 'Нормально'}
              {rating === 4 && 'Хорошо'}
              {rating === 5 && 'Отлично'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!showComment && rating > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComment(true)}
              className="text-xs"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Добавить комментарий
            </Button>
          )}
          {rating > 0 && !showComment && (
            <Button size="sm" onClick={handleSubmit} className="text-xs">
              <Send className="w-3 h-3 mr-1" />
              Отправить
            </Button>
          )}
        </div>
      </div>

      {showComment && (
        <div className="space-y-2 animate-fade-up">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">
              Комментарий (необязательно):
            </label>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowComment(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <Textarea
            placeholder="Что можно улучшить в ответе?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="resize-none text-sm"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSubmit}>
              <Send className="w-3 h-3 mr-1" />
              Отправить оценку
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
