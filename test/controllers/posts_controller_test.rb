require 'test_helper'

class PostsControllerTest < ActionController::TestCase

  # browsers (anonymous users)

  test "a browsing user should get index of posts for a given topic, if its public" do
    get :index, topic_id: topics(:public).id
    assert_response :success
  end

  test "a browsing user should NOT get index of posts for a given topic, if its private" do
    get :index, topic_id: topics(:pending).id
    assert_redirected_to root_path
  end

  test "a browsing user should not be able to see inactive posts" do
    post = posts(:inactive_reply)
    get :index, topic_id: topics(:public).id
    assert (not assigns(:posts).include? post.id)
  end

  test "a browsing user should not be able to vote" do
    assert_difference 'Post.find(6).points', 0 do
      get :index, forum_id: 3
      xhr :post, :up_vote, { id: 6 }
    end
  end

  # logged in user

  test "a signed in user should see one reply form" do
    sign_in users(:user)

    # Loop through several test cases for different types of topic layout/voteability etc.
    # The Q&A format uses an inline reply form immediately beneath the original question
    [4,5,7,8].each do |topic_id|
      get :index, topic_id: topic_id
      assert_select 'div.add-form', true, "failed on #{topic_id}"
      assert :success
    end
  end

  test "a signed in user should be able to reply to a topic" do
    sign_in users(:user)
    assert_difference 'Post.count', 1 do
      xhr :post, :create, topic_id: 1, post: { user_id: User.find(2).id, body: 'new reply', kind: 'reply' }
    end
    assert :success
  end

  test "a signed in user should NOT be able to edit a post" do
    sign_in users(:user)
    original_post = Post.find(1)
    xhr :patch, :update, { id: 1, post: { body: 'this has changed' }}
    assert original_post.body == Post.find(1).body
    assert :success
  end

  test "a signed in user should be able to post a reply to an open topic and the topic status should change to pending" do
    sign_in users(:user)
    assert_difference 'Topic.where(current_status: "pending").count', 1 do
      xhr :post, :create, topic_id: 1, post: { user_id: User.find(2).id, body: 'new reply', kind: 'reply' }
    end
  end

  test "a signed in user should be able to vote" do
    sign_in users(:user)
    assert_difference 'Post.find(6).points', 1 do
      xhr :post, :up_vote, id: 6, topic_id: 5
    end
  end


  # logged in admin

  # TODO this belongs in the admin controller test where all admin logic resides
  test "an admin should be able to see inactive posts" do

  end


  test "an admin should be able to reply to a private topic, and the system should send an email" do
    sign_in users(:admin)

    assert_difference 'ActionMailer::Base.deliveries.size', 1 do
      assert_difference 'Post.count', 1 do
        xhr :post, :create, topic_id: 1, post: { user_id: User.find(2).id, body: 'new reply', kind: 'reply' }
      end
    end
    assert :success
  end

  test "an admin should be able to reply to a public topic, and the system should NOT send an email" do
    sign_in users(:admin)

    assert_difference 'ActionMailer::Base.deliveries.size', 0 do
      assert_difference 'Post.count', 1 do
        xhr :post, :create, topic_id: 4, post: { user_id: User.find(2).id, body: 'new reply', kind: 'reply' }
      end
    end
    assert :success
  end

  test "an admin should be able to edit a post" do
    sign_in users(:admin)
    old = Post.find(1).body
    xhr :patch, :update, {id: 1, post: { body: 'this has changed' }  }
    assert old != Post.find(1).body
    assert :success
  end

  test "an admin should be able to post a reply to a pending ticket, and the topic status should change to open" do
    sign_in users(:admin)
    assert_difference 'Topic.where(current_status: "open").count', 1 do
      xhr :post, :create, topic_id: 2, post: { user_id: User.find(1).id, body: 'new reply', kind: 'reply' }
    end
  end

end
