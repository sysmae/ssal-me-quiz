// utils/quiz_collections.ts
import { createClient } from '@/utils/supabase/client'
import { QuizCollection, QuizCollectionQuestion } from '@/types/quiz_collection'

const supabase = createClient()

export const quizCollections = {
  // 컬렉션 생성 및 관리
  manage: {
    // 새 컬렉션 생성
    create: async (
      name: string,
      type: 'wrong_answers' | 'favorites' | 'custom',
      description?: string
    ) => {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error('User not found')

      const { data, error } = await supabase
        .from('quiz_collections')
        .insert({
          user_id: userId,
          name,
          description,
          collection_type: type,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 컬렉션 정보 업데이트
    update: async (
      collectionId: number,
      updates: { name?: string; description?: string }
    ) => {
      const { data, error } = await supabase
        .from('quiz_collections')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', collectionId)
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 컬렉션 삭제
    delete: async (collectionId: number) => {
      const { error } = await supabase
        .from('quiz_collections')
        .delete()
        .eq('id', collectionId)

      if (error) throw error
      return true
    },
  },

  // 컬렉션 문제 관리
  questions: {
    // 컬렉션에 문제 추가
    add: async (collectionId: number, questionId: number, notes?: string) => {
      const { data, error } = await supabase
        .from('quiz_collection_questions')
        .insert({
          collection_id: collectionId,
          question_id: questionId,
          notes,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 컬렉션에서 문제 제거
    remove: async (collectionId: number, questionId: number) => {
      const { error } = await supabase
        .from('quiz_collection_questions')
        .delete()
        .match({ collection_id: collectionId, question_id: questionId })

      if (error) throw error
      return true
    },

    // 문제 노트 업데이트
    updateNotes: async (
      collectionId: number,
      questionId: number,
      notes: string
    ) => {
      const { data, error } = await supabase
        .from('quiz_collection_questions')
        .update({ notes })
        .match({ collection_id: collectionId, question_id: questionId })
        .select()
        .single()

      if (error) throw error
      return data
    },

    // 컬렉션의 모든 문제 가져오기
    getAll: async (collectionId: number) => {
      const { data, error } = await supabase
        .from('quiz_collection_questions')
        .select(
          `
          *,
          question:quiz_questions(*)
        `
        )
        .eq('collection_id', collectionId)
        .order('added_at', { ascending: false })

      if (error) throw error
      return data
    },
  },

  // 컬렉션 조회 기능
  list: {
    // 사용자의 모든 컬렉션 가져오기
    getUserCollections: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error('User not found')

      const { data, error } = await supabase
        .from('quiz_collections')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data
    },

    // 특정 유형의 컬렉션 가져오기
    getCollectionsByType: async (
      type: 'wrong_answers' | 'favorites' | 'custom'
    ) => {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error('User not found')

      const { data, error } = await supabase
        .from('quiz_collections')
        .select('*')
        .eq('user_id', userId)
        .eq('collection_type', type)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data
    },

    // 컬렉션 상세 정보 가져오기
    getCollectionDetails: async (collectionId: number) => {
      const { data, error } = await supabase
        .from('quiz_collections')
        .select('*')
        .eq('id', collectionId)
        .single()

      if (error) throw error
      return data
    },
  },

  // 특수 기능
  special: {
    // 오답 노트 생성 및 틀린 문제 추가
    createWrongAnswersCollection: async (
      attemptId: number,
      name: string = '오답 노트'
    ) => {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error('User not found')

      // 새 컬렉션 생성
      const { data: collection, error: collectionError } = await supabase
        .from('quiz_collections')
        .insert({
          user_id: userId,
          name,
          collection_type: 'wrong_answers',
        })
        .select()
        .single()

      if (collectionError) throw collectionError

      // 틀린 문제 가져오기
      const { data: wrongAnswers, error: wrongAnswersError } = await supabase
        .from('quiz_attempt_questions')
        .select('question_id')
        .eq('attempt_id', attemptId)
        .eq('is_correct', false)

      if (wrongAnswersError) throw wrongAnswersError

      // 컬렉션에 틀린 문제 추가
      if (wrongAnswers && wrongAnswers.length > 0) {
        const questionsToInsert = wrongAnswers.map((q) => ({
          collection_id: collection.id,
          question_id: q.question_id,
        }))

        const { error } = await supabase
          .from('quiz_collection_questions')
          .insert(questionsToInsert)

        if (error) throw error
      }

      return collection
    },

    // 즐겨찾기 컬렉션 가져오기 또는 생성
    getFavoritesCollection: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error('User not found')

      // 기존 즐겨찾기 컬렉션 찾기
      const { data: existingCollection, error: findError } = await supabase
        .from('quiz_collections')
        .select('*')
        .eq('user_id', userId)
        .eq('collection_type', 'favorites')
        .maybeSingle()

      if (findError) throw findError

      // 기존 컬렉션이 있으면 반환
      if (existingCollection) return existingCollection

      // 없으면 새로 생성
      const { data: newCollection, error: createError } = await supabase
        .from('quiz_collections')
        .insert({
          user_id: userId,
          name: '즐겨찾기',
          collection_type: 'favorites',
        })
        .select()
        .single()

      if (createError) throw createError
      return newCollection
    },
  },
}
